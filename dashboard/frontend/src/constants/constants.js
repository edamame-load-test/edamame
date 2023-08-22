const ARCHIVE = "edamame-load-tests";
const DEFAULT_AWS_S3_STORAGE_CLASS = "STANDARD";
const VALID_STORAGE_CLASSES = {
  STANDARD: "Standard",
  REDUCED_REDUNDANCY: "Reduced Redundancy",
  STANDARD_IA: "Standard Infrequent Access",
  ONEZONE_IA: "One Zone Infrequent Access",
  INTELLIGENT_TIERING: "Standard Intelligent-Tiering",
  GLACIER: "Glacier Flexible Retrieval",
  DEEP_ARCHIVE: "Glacier Deep Archive",
  GLACIER_IR: "Glacier Instant Retrieval",
};

export { ARCHIVE, DEFAULT_AWS_S3_STORAGE_CLASS, VALID_STORAGE_CLASSES };
