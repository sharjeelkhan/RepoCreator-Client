export class Repository {
	constructor(
		public provider: string,
		public auth_token: string,
		public owner: string,
		public name: string
	) {}

	public static deserialize(input: any): Repository {
		return new Repository(
			input.provider,
			input.auth_token,
			input.owner,
			input.name
		);
	}
}
