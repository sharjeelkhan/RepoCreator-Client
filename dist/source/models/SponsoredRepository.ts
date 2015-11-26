import { Repository } from 'source/models/Repository';

export class SponsoredRepository {
	constructor(
		public repository: Repository,
		public expiration_date: string,
		public sponsor_user_id: string
	) {}

	public static deserialize(input: any): SponsoredRepository {
		return new SponsoredRepository(
			Repository.deserialize(input.repository),
			input.expiration_date,
			input.sponsor_user_id);
	}
}
