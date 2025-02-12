/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			keyframes: {
				slideInBounceText: {
					'0%': {
						transform: 'translateY(-50%)',
						opacity: '0',
					},
					'50%': {
						transform: 'translateY(10%)',
						opacity: '1',
					},
					'75%': {
						transform: 'translateY(-5%)',
					},
					'90%': {
						transform: 'translateY(1.67%)',
					},
					'100%': {
						transform: 'translateY(0)',
					},
				},
				slideInBounceSvg: {
					'0%': {
						transform: 'translateX(-5%)',
						opacity: '0',
					},
					'50%': {
						transform: 'translateX(1.25%)',
						opacity: '1',
					},
					'75%': {
						transform: 'translateX(-0.625%)',
					},
					'90%': {
						transform: 'translateX(0.3125%)',
					},
					'100%': {
						transform: 'translateX(0)',
					},
				},
				fadeIn: {
					'0%': { 
						opacity: 0
					},
					'100%': {
						opacity: 1
					}
				},
				fadeInSlides: {
					from: { opacity: '0.8' },
					to: { opacity: '1' }
				},
				scrollBounce: {
					'0%, 20%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(110vh)' },
					'65%': { transform: 'translateY(95vh)' },
					'80%': { transform: 'translateY(100vh)' },
					'90%': { transform: 'translateY(98vh)' },
					'100%': { transform: 'translateY(100vh)' }
				},
				loadingBar: {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				}
			},
			animation: {
				'slide-in-bounce-text': 'slideInBounceText 1.2s cubic-bezier(0.25, 1.25, 0.5, 1.5)',
				'slide-in-bounce-svg': 'slideInBounceSvg 1.2s cubic-bezier(0.25, 1.25, 0.5, 1.5)',
				'fadeIn': 'fadeIn 1.2s linear',
				'fadeInSlides': 'fadeInSlides 1.5s ease-in-out',
				'scroll-bounce': 'scrollBounce 1.5s cubic-bezier(0.68, -0.6, 0.32, 1.6)',
				'loading-bar': 'loadingBar 1.5s ease-in-out infinite'
			},
			fontFamily: {
				'poppins': ['Poppins'],
			},
			colors: {
				"highlight-1": "var(--highlight-1)",
				"highlight-2": "var(--highlight-2)",
				"highlight-3": "var(--highlight-3)",
				"background-1": "var(--background-1)",
				"background-2": "var(--background-2)",
				"background-3": "var(--background-3)",
				"background-4": "var(--background-4)",
				"text-1": "var(--text-1)",
				"text-2": "var(--text-2)",
			},
			boxShadow: {
				'book': '0px 0px 60px -15px rgba(0, 0, 0, 0.5)',
				},
			utilities: {
				'.scrollbar-hide': {
					/* IE and Edge */
					'-ms-overflow-style': 'none',
					/* Firefox */
					'scrollbar-width': 'none',
					/* Safari and Chrome */
					'&::-webkit-scrollbar': {
						display: 'none'
					}
				}
			}
		},
	},
	plugins: [],
}
