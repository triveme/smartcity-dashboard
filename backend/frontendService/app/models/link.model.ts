import { InferSchemaType, Schema, model } from "mongoose";

interface IInfoLink {
    infoLinkTitle: string,
    infoLinkUrl: string,
    infoLinkDescription: string,
}

const infoLinkSchema: Schema<IInfoLink> = new Schema({
    infoLinkTitle: String,
    infoLinkUrl: String,
    infoLinkDescription: String,
});

type InfoLink = InferSchemaType<typeof infoLinkSchema>;

const InfoLinkModel = model<InfoLink>("InfoLink", infoLinkSchema);

export { IInfoLink, InfoLink, InfoLinkModel, infoLinkSchema };
