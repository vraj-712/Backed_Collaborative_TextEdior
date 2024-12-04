import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    _id: String,
    data: Object,
    users:{
        type: Number,
        default: 1
    }
});

export const Document = mongoose.model("Document", documentSchema);