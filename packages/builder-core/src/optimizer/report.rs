#[derive(Debug, Default, Clone, PartialEq, Eq)]
pub struct OptimizationReport {
    pub created: usize,
    pub skipped: usize,
    pub input_bytes: u64,
    pub output_bytes: u64,
    pub warnings: Vec<String>,
}

impl OptimizationReport {
    pub(super) fn created(input_bytes: u64, output_bytes: u64) -> Self {
        Self {
            created: 1,
            input_bytes,
            output_bytes,
            ..Self::default()
        }
    }

    pub(super) fn skipped(warning: String) -> Self {
        Self {
            skipped: 1,
            warnings: vec![warning],
            ..Self::default()
        }
    }

    pub(super) fn merge(&mut self, other: Self) {
        self.created += other.created;
        self.skipped += other.skipped;
        self.input_bytes += other.input_bytes;
        self.output_bytes += other.output_bytes;
        self.warnings.extend(other.warnings);
    }
}
