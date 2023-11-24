export type TPanel = {
  chat: {
    nickname: string;
    content: { text: string; timestamp: Date }[];
  }[];
  background: string;
};

export type TMessageContent = {
  text: string;
};
