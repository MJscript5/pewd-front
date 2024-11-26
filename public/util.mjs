// Function to fetch metadata (title) of a link using LinkPreview API
export async function fetchLinkMetadata(url) {
    const apiKey = '18beed1b4b1704d93b9885b825e26939';  // Replace with your actual API key
    const apiUrl = `https://api.linkpreview.net/?key=${apiKey}&q=${encodeURIComponent(url)}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // If metadata is available, return the title or fallback to URL
        if (data.title) {
            return data.title;
        } else {
            return url;  // If no title, return the URL itself
        }
    } catch (error) {
        console.error('Error fetching link metadata:', error);
        return url;  // Return the URL if metadata fetch fails
    }
}

export async function convertLinksWithMetadata(text) {
    const urlPattern = /(\b(?:https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    
    console.log("Original text:", text);  // Debugging: Show the original input text

    // Split the text into parts that are URLs and non-URLs
    let parts = text.split(urlPattern);
    console.log("Split parts:", parts);  // Debugging: Show the split text parts

    let result = "";

    for (let i = 0; i < parts.length; i++) {
        if (urlPattern.test(parts[i])) {
            console.log(`Processing URL: ${parts[i]}`);  // Debugging: Show URL being processed

            try {
                // For parts that are URLs, fetch metadata (title) and embed it
                const title = await fetchLinkMetadata(parts[i]);
                console.log(`Fetched title: ${title}`);  // Debugging: Show fetched title

                // Extract domain name (without protocol) from URL
                const urlObj = new URL(parts[i]);
                const domain = urlObj.hostname;  // This removes the protocol
                console.log(`Extracted domain: ${domain}`);  // Debugging: Show extracted domain

                // Embed the title if available, or fall back to the domain name
                result += `<a href="${parts[i]}" target="_blank" rel="noopener noreferrer">${title || domain}</a>`;
            } catch (error) {
                console.error("Error fetching metadata:", error);  // Debugging: Log errors during metadata fetch
                // If there's an error fetching metadata, just link to the URL directly
                result += `<a href="${parts[i]}" target="_blank" rel="noopener noreferrer">${parts[i]}</a>`;
            }
        } else {
            console.log(`Adding non-URL part: ${parts[i]}`);  // Debugging: Show non-URL text being added
            // Otherwise, it's normal text, just append it
            result += parts[i];
        }
    }

    console.log("Final result:", result);  // Debugging: Show final result

    return result;
}
