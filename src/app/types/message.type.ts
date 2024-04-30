export type MessageType = {
    authorId: string;
    postTime: number;
    text: string;
    answers: Object;

    // authorName: string | null;      Name des verfassenden Users
    // authorImage: string | null;     Bild des verfassednen Users
}