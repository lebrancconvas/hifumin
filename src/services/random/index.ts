export const randomBetween = (min: number, max: number) =>
		Math.floor(Math.random() * (max - min + 1) + min)
export const randomPick = <T>(data: T[]): T => data[randomBetween(0, data.length - 1)]
