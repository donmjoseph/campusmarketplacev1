export const tw = {
  layout: {
    container: 'mx-auto max-w-[1200px] px-6 max-md:px-3.5',
    narrowContainer: 'mx-auto max-w-[740px] px-6 max-md:px-3.5',
    pageHeaderCard: 'mb-10 flex min-h-[124px] flex-col justify-center rounded-lg border border-[#e8e8e8] bg-white px-[34px] py-[30px] max-md:mb-6 max-md:min-h-[100px] max-md:px-[18px] max-md:py-5',
    pageHeaderTitle: 'mb-1 text-[1.9rem] leading-[1.2] font-extrabold text-[#262626] max-md:text-[1.45rem]',
    pageHeaderSubtitle: 'm-0 text-[0.95rem] leading-[1.45] text-[#737373]',
  },
  button: {
    base: 'inline-flex items-center gap-2 whitespace-nowrap rounded border-2 border-transparent px-6 py-[11px] text-[0.92rem] leading-[1.25] font-bold no-underline transition-all duration-200 disabled:pointer-events-none disabled:opacity-45',
    primary: 'border-[#981e32] bg-[#981e32] text-white hover:border-[#7a1628] hover:bg-[#7a1628]',
    secondary: 'border-[#981e32] bg-white text-[#981e32] hover:bg-[#fce4ec]',
    ghost: 'border-[#ccc] bg-transparent text-[#555] hover:border-[#aaa] hover:bg-[#f5f5f5]',
    danger: 'border-[#b71c1c] bg-[#b71c1c] text-white hover:border-[#7f0000] hover:bg-[#7f0000]',
    success: 'border-[#2e7d32] bg-[#2e7d32] text-white hover:bg-[#1b5e20]',
    dark: 'border-[#262626] bg-[#262626] text-white hover:bg-black',
    sm: 'px-[14px] py-[6px] text-[0.8rem]',
    lg: 'px-8 py-[14px] text-[1rem]',
    full: 'w-full justify-center',
  },
  form: {
    control: 'h-[46px] w-full rounded-md border border-[#d9d9d9] bg-[#fcfcfc] px-3 text-[0.95rem] text-[#262626] outline-none transition-colors duration-200 focus:border-[#981e32]',
  },
  card: {
    panel: 'rounded-md border border-[#e5e5e5] bg-white',
    product: 'flex flex-col overflow-hidden rounded-md border border-[#e5e5e5] bg-white text-inherit no-underline transition-[box-shadow,transform] duration-200 hover:-translate-y-[3px] hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)]',
  },
}
