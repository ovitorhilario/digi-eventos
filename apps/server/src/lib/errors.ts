export class AppError extends Error {
	constructor(
		public error: string,
		public message: string,
		public status: number = 500
	) {
		super(message);
		this.name = 'AppError';
	}
}