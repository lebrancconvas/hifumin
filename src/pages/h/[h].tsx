import {
	Fragment,
	useEffect,
	useCallback,
	useRef,
	useReducer,
	useState,
	FunctionComponent
} from "react"

import Head from "next/head"
import { GetStaticPaths, GetStaticProps } from "next"

import Page from "@components/page"
import Cover from "@components/cover"

import fetch from "@libs/fetch"

import { Story } from "@types"

import "@styles/h.styl"

interface Props {
	story: string
}

type Component = FunctionComponent<Props>

const Code: Component = ({ story }) => {
	let [allowPage, increaseAllowPage] = useReducer(
			(allowPage) => allowPage + 20,
			20
		),
		[totalPage, updateTotalPage] = useState(20)

	let previousLazyLoad = useRef<() => void>()

	useEffect(() => {
		if (previousLazyLoad.current)
			document.removeEventListener("scroll", previousLazyLoad.current)

		if (allowPage < totalPage)
			document.addEventListener("scroll", lazyLoad, {
				passive: true
			})

		previousLazyLoad.current = lazyLoad
	}, [allowPage, totalPage])

	useEffect(() => {
		if (typeof story === "undefined") return

		let {
			id,
			images: { pages }
		} = JSON.parse(story)

		if (id) updateTotalPage(pages.length)
	}, [story, updateTotalPage])

	let lazyLoad = useCallback(() => {
		let pageHeight = window.innerHeight

		if (
			totalPage <= allowPage ||
			document.body.scrollHeight >= window.pageYOffset + pageHeight * 2.5
		)
			return

		increaseAllowPage()
	}, [allowPage, increaseAllowPage, totalPage])

	// ? Generating
	if (typeof story === "undefined")
		return (
			<main id="h">
				<Cover preload />
				<section className="pages">
					{Array(20)
						.fill(0)
						.map(({ link }, index) => (
							<Page
								key={index}
								preload
								link={`preload-${link}`}
							/>
						))}
				</section>
			</main>
		)

	let data: Story = JSON.parse(story)

	// ? Not valid
	if (!data.id) return <main id="h">Not Found</main>

	let {
		images: { cover, pages },
		title,
		metadata,
		info
	} = data

	return (
		<Fragment>
			<Head>
				<link rel="preload" as="image" href={cover.link} />
				<link rel="preload" as="image" href={pages[0].link} />
				{pages.map(({ link }, index) =>
					!index || index > 4 ? null : (
						<link key={link} rel="preconnect" href={link} />
					)
				)}
				{pages.map(({ link }, index) =>
					index < 5 || index > allowPage ? null : (
						<link key={link} rel="dns-prefetch" href={link} />
					)
				)}
			</Head>
			<main id="h">
				<Cover story={data} />
				<section className="pages">
					{pages.map(({ link }, index) =>
						index < allowPage ? (
							<Page key={link} link={link} index={index} />
						) : null
					)}
				</section>
			</main>
		</Fragment>
	)
}

export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: [],
		fallback: true
	}
}

export const getStaticProps: GetStaticProps<Props> = async ({
	params: { h }
}) => {
	let story

	try {
		story = JSON.stringify(await fetch(`https://nhapi.now.sh/${h}`))
	} catch (err) {
		story = JSON.stringify({ id: "0" })
	}

	return {
		props: {
			story
		},
		revalidate: 3600
	}
}

export default Code
