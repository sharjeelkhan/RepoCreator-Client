import { Repository } from 'source/models/Repository';

export class Request {
	public constructor(
		public destination_repository: Repository,
		public template_repository: Repository,
		public replacements: any
	) {}

	public static deserialize(input: any): Request {
		return new Request(
			Repository.deserialize(input.destination_repo),
			Repository.deserialize(input.template_repo),
			input.replacements
		);
	}
}

export class Progress {
	public constructor(
		public progress_token: string,
		public current_step: Step,
		public success_result: string,
		public failure_result: string
	) {}

	public static deserialize(input: any): Progress {
		return new Progress(
			input.progress_token,
			Step.deserialize(input.current_step),
			input.success_result,
			input.failure_result
		);
	}
}

export enum Step {
	Queued,
	Processing,
	Succeeded,
	Failed
}

export module Step {
	export var deserialize = (input: string): Step => {
		switch (input)
		{
			case 'Queued':
				return Step.Queued;
			case 'Processing':
				return Step.Processing;
			case 'Succeeded':
				return Step.Succeeded;
			case 'Failed':
				return Step.Failed;
			default:
				throw new Error(`Unknown CreateRepo Progress Step ${input}.`);
		}
	}
}
