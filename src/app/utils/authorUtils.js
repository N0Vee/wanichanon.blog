// Helper function to get author display name from PayloadCMS User object
export const getAuthorName = (author) => {
  if (typeof author === 'object' && author && 'email' in author) {
    return author.email.split('@')[0] // Use email username
  }
  return 'Anonymous'
}

// Helper function to get author full name or email
export const getAuthorFullName = (author) => {
  if (typeof author === 'object' && author && 'email' in author) {
    // Check if first/last name exists
    if (author.firstName && author.lastName) {
      return `${author.firstName} ${author.lastName}`
    }
    if (author.firstName) {
      return author.firstName
    }
    // Fall back to email username
    return author.email.split('@')[0]
  }
  return 'Anonymous'
}
