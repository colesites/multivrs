use regex::{Captures, Regex};
use serde::{Deserialize, Serialize};
use std::mem;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Route {
    src: String,
    dest: Option<String>,
    status: Option<u16>,
    headers: Option<std::collections::HashMap<String, String>>,
    methods: Option<Vec<String>>,
    #[serde(default, rename = "continue")]
    should_continue: bool,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct MatchInput {
    routes: Vec<Route>,
    pathname: String,
    method: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MatchResult {
    matched: bool,
    pathname: String,
    status: Option<u16>,
    headers: std::collections::HashMap<String, String>,
    is_redirect: bool,
    redirect_location: Option<String>,
}

pub fn match_routes(routes: &[Route], pathname: &str, method: Option<&str>) -> MatchResult {
    let mut result = MatchResult {
        matched: false,
        pathname: pathname.to_owned(),
        status: None,
        headers: Default::default(),
        is_redirect: false,
        redirect_location: None,
    };
    for route in routes {
        if !allows_method(route, method) {
            continue;
        }
        let Ok(regex) = Regex::new(&format!("^(?:{})$", route.src)) else {
            continue;
        };
        let Some(captures) = regex.captures(&result.pathname) else {
            continue;
        };
        result.matched = true;
        result.headers.extend(route.headers.clone().unwrap_or_default());
        result.status = route.status.or(result.status);
        if let Some(destination) = &route.dest {
            let resolved = replace_captures(destination, &captures);
            if route.status.is_some_and(|status| matches!(status, 301 | 302 | 303 | 307 | 308)) {
                result.is_redirect = true;
                result.redirect_location = Some(resolved);
                return result;
            }
            result.pathname = resolved;
        }
        if !route.should_continue {
            return result;
        }
    }
    result
}

fn allows_method(route: &Route, method: Option<&str>) -> bool {
    match (&route.methods, method) {
        (Some(methods), Some(actual)) => methods.iter().any(|item| item.eq_ignore_ascii_case(actual)),
        _ => true,
    }
}

fn replace_captures(destination: &str, captures: &Captures<'_>) -> String {
    let mut output = String::new();
    captures.expand(destination, &mut output);
    output
}

#[unsafe(no_mangle)]
pub extern "C" fn alloc(length: usize) -> *mut u8 {
    let mut bytes = Vec::<u8>::with_capacity(length);
    let pointer = bytes.as_mut_ptr();
    mem::forget(bytes);
    pointer
}

#[unsafe(no_mangle)]
/// Releases a buffer previously returned by [`alloc`].
///
/// # Safety
///
/// `pointer` must come from `alloc(length)`, must not have been released, and
/// `length` must be the exact capacity originally requested.
pub unsafe extern "C" fn dealloc(pointer: *mut u8, length: usize) {
    if !pointer.is_null() {
        drop(unsafe { Vec::from_raw_parts(pointer, 0, length) });
    }
}

#[unsafe(no_mangle)]
/// Tests a JSON-encoded `[pattern, pathname]` pair.
///
/// # Safety
///
/// `pointer` must reference a readable allocation containing at least `length`
/// bytes for the duration of this call.
pub unsafe extern "C" fn matches_pattern(pointer: *const u8, length: usize) -> i32 {
    let bytes = unsafe { std::slice::from_raw_parts(pointer, length) };
    let Ok(input) = serde_json::from_slice::<[String; 2]>(bytes) else {
        return 0;
    };
    Regex::new(&format!("^(?:{})$", input[0]))
        .is_ok_and(|regex| regex.is_match(&input[1]))
        .into()
}

#[unsafe(no_mangle)]
/// Matches a JSON-encoded route request and returns a packed output buffer.
///
/// # Safety
///
/// `pointer` must reference a readable allocation containing at least `length`
/// bytes for the duration of this call. The returned buffer must be released
/// with [`dealloc`] after the caller has copied its contents.
pub unsafe extern "C" fn match_routes_json(pointer: *const u8, length: usize) -> u64 {
    let bytes = unsafe { std::slice::from_raw_parts(pointer, length) };
    let output = serde_json::from_slice::<MatchInput>(bytes)
        .map(|input| match_routes(&input.routes, &input.pathname, input.method.as_deref()))
        .and_then(|result| serde_json::to_vec(&result))
        .unwrap_or_else(|_| b"{\"matched\":false,\"pathname\":\"/\",\"headers\":{},\"isRedirect\":false}".to_vec());
    pack_output(output)
}

fn pack_output(mut output: Vec<u8>) -> u64 {
    output.shrink_to_fit();
    let length = output.len() as u64;
    let pointer = output.as_mut_ptr() as u64;
    mem::forget(output);
    (length << 32) | pointer
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rewrites_and_redirects_with_captures() {
        let routes: Vec<Route> = serde_json::from_str(
            r#"[{"src":"/old/(.*)","dest":"/new/$1","status":308}]"#,
        )
        .unwrap();
        let result = match_routes(&routes, "/old/docs", Some("GET"));
        assert!(result.is_redirect);
        assert_eq!(result.redirect_location.as_deref(), Some("/new/docs"));
    }
}
