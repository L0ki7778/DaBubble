export type MessageType = {
    authorId: string;               // Doc.ID des verfassenden Users
    postTime: number;               // Zeitpunkt des sendens der Nachricht
    text: string;                   // Text/Inahalt der Nachricht
    answers: Object;                // Neues JSON Array mit Antworten auf eine Nachrichten
    reactions: Object;              // Array mit Reaktionen auf die Nachricht    

    // authorName: string | null;      Name des verfassenden Users
    // authorImage: string | null;     Bild des verfassednen Users
}