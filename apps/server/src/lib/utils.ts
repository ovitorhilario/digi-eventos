/**
 * Converte uma string base64 para Uint8Array
 * @param base64String - String em formato base64
 * @returns Uint8Array contendo os dados binários
 */
export function base64ToUint8Array(base64String: string): Uint8Array {
	// Remove o prefixo data URI se existir (ex: data:image/png;base64,)
	const base64Data = base64String.replace(/^data:[^,]*;base64,/, '');
	
	// Decodifica a string base64
	const binaryString = atob(base64Data);
	const bytes = new Uint8Array(binaryString.length);
	
	for (let i = 0; i < binaryString.length; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}
	
	return bytes;
}

/**
 * Converte Uint8Array para string base64
 * @param uint8Array - Dados binários em Uint8Array
 * @returns String em formato base64
 */
export function uint8ArrayToBase64(uint8Array: Uint8Array): string {
	let binaryString = '';
	
	for (let i = 0; i < uint8Array.length; i++) {
		const byte = uint8Array[i];
		if (byte !== undefined) {
			binaryString += String.fromCharCode(byte);
		}
	}
	
	return btoa(binaryString);
}

/**
 * Valida se uma string é uma URL válida
 * @param url - String para validar
 * @returns true se for uma URL válida
 */
export function isValidUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}