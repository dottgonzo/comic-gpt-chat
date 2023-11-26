export type TPanelConversationContent = {
  text: string;
  datetime: Date;
};
export type TPanelUserChat = {
  memberId: string;
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
