// Channel info configuration for messages
const channelInfo = {
    contextInfo: {
        forwardingScore: 0,       // 0 means message is not treated as forwarded
        isForwarded: false        // false removes the "forwarded" label in WhatsApp
        // forwardedNewsletterMessageInfo removed to hide channel/newsletter info
    }
};

module.exports = {
    channelInfo
};
