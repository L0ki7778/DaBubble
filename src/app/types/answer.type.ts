export type AnswerType = {
    authorId: string;               // Doc.ID des verfassenden Users
    postTime: number;               // Zeitpunkt des sendens der Nachricht
    text: string;                   // Text/Inahalt der Nachricht
    reactions: Object;              // Array mit Reaktionen auf die Nachricht    

    // authorName: string | null;      Name des verfassenden Users
    // authorImage: string | null;     Bild des verfassednen Users
}