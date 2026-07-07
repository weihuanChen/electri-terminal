declare module "nodemailer" {
  import type { Buffer } from "node:buffer";

  export interface TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user?: string;
      pass?: string;
    };
  }

  export interface SendMailAttachment {
    filename?: string;
    content?: string | Buffer | Uint8Array;
    contentType?: string;
  }

  export interface SendMailOptions {
    from?: string;
    to?: string;
    cc?: string;
    replyTo?: string;
    subject?: string;
    text?: string;
    attachments?: SendMailAttachment[];
  }

  export interface Transporter {
    sendMail(options: SendMailOptions): Promise<unknown>;
  }

  const nodemailer: {
    createTransport(options: TransportOptions): Transporter;
  };

  export default nodemailer;
}
