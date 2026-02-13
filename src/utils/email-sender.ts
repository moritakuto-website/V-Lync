export interface EmailPayload {
    from_display_name: string;
    from_email: string;
    reply_to: string;
    to_email: string;
    subject: string;
    body_html: string;
}

export async function sendEmailMock(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: any }> {
    console.log("=== \x1b[36mMOCK EMAIL SENDING\x1b[0m ===");
    console.log(`From: ${payload.from_display_name} <${payload.from_email}>`);
    console.log(`Reply-To: ${payload.reply_to}`);
    console.log(`To: ${payload.to_email}`);
    console.log(`Subject: ${payload.subject}`);
    console.log("--------------------------------");
    // console.log(payload.body_html); // Too verbose for log
    console.log("[Body HTML Hidden]");
    console.log("================================");

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        success: true,
        messageId: `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`
    };
}
