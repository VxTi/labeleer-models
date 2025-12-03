export class ParsingError extends Error {
  constructor(message: string) {
    super(`Parsing Error: ${message}`);
    this.name = 'ParsingError';
  }
}

export class SerializationError extends Error {
  constructor(message: string) {
    super(`Serialization Error: ${message}`);
    this.name = 'SerializationError';
  }
}
