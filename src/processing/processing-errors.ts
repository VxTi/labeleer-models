export class ParsingError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(`Parsing Error: ${message}`, options);
    this.name = 'ParsingError';
  }
}

export class SerializationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(`Serialization Error: ${message}`, options);
    this.name = 'SerializationError';
  }
}
