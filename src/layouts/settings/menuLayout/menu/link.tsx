import Link from 'next/link'

import { ChevronRight } from '@icons'

import { MenuLinkComponent } from './types'

import styles from './menu.module.sass'

const MenuLink: MenuLinkComponent = ({ children, href, disabled = false }) => {
	return (
		<Link href={href}>
			<a
				className={`${styles.menu} ${styles['-link']} ${
					disabled ? styles['-disabled'] : ''
				}`}
				role="section"
			>
				{children}
				<ChevronRight />
			</a>
		</Link>
	)
}

export default MenuLink
