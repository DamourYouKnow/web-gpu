export async function requestFile(url: string): Promise<string> {
    const response = await fetch(url, {
        method: 'GET',
        mode: 'same-origin',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'text/plain'
        }
    });

    const responseText = await response.text();
    return responseText;
}