export type TPanelConversationContent = {
  text: string;
  datetime: Date;
};
export type TPanelUserChat = {
  member_id: string;
  character: string;
  contents: TPanelConversationContent[];
};
export type TPanel = {
  usersChats: TPanelUserChat[];
  background: string;
};

export type TMessageContent = {
  text: string;
};

export type TToken = {
  member_id: string;
};
