export class Repository {
	constructor(
		public provider: string,
		public owner: string,
		public name: string
	) {}

	public static deserialize(input: any): Repository {
		return new Repository(
			input.provider,
			input.owner,
			input.name
		);
	}
}
