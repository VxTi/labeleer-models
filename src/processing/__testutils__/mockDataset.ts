export function mockJsonDataset() {
  return {
    'first-entry': {
      translations: {
        en_US: 'hello',
        nl_NL: 'world',
      },
    },
    'second-entry': {
      translations: {
        en_US: 'hello',
        nl_NL: 'again',
      },
    },
  };
}

export function mockSerializedJsonDataset() {
  return `{
    "first-entry": {
    "translations": {
      "en_US": "hello",
      "nl_NL": "world"
    }
  },
  "second-entry": {
    "translations": {
      "en_US": "hello",
      "nl_NL": "again"
    }
  }
}`;
}
