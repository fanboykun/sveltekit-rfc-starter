export function titleCase(text: string) {
	return text
		.replace(/([a-z])([A-Z])/g, '$1 $2') // First split camelCase/PascalCase words
		.split(/[\s\-_]+/) // Split on whitespace, hyphens, and underscores
		.filter((word) => word.length > 0) // Remove empty strings
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
		.join(' ');
}

export function createRandomString(length: number = 10) {
	return Math.random()
		.toString(36)
		.substring(2, length + 2);
}
