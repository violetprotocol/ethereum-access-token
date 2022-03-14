interface Mail {
  from: Person;
  to: Person;
  contents: string;
}

interface Person {
  name: string;
  wallet: string;
}

// The named list of all type definitions
const MailMessageTypes = {
  Person: [
    { name: "name", type: "string" },
    { name: "wallet", type: "address" },
  ],
  Mail: [
    { name: "from", type: "Person" },
    { name: "to", type: "Person" },
    { name: "contents", type: "string" },
  ],
};

export { Mail, Person, MailMessageTypes };
