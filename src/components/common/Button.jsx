export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) {
  const baseClasses = 'btn'
  
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
  }
  
  const sizes = {
    sm: 'btn-sm',
    md: '',
    lg: 'px-6 py-3 text-lg',
  }
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
