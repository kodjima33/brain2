export interface Payload {
  template_type: string;
  text: string;
  buttons: Button[];
}
export interface Attachment {
  type: string;
  payload: Payload;
}
