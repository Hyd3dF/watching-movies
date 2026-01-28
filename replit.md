# Film Dünyası (Movie World)

## Overview

Film Dünyası is a Turkish-language movie discovery web application that allows users to browse popular films and search for movies. The application fetches movie data from The Movie Database (TMDB) API and displays them in a responsive grid layout with a Netflix-inspired dark theme design.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Static Website**: Pure HTML, CSS, and JavaScript without any frontend framework
- **Single Page Design**: All functionality contained in a single `index.html` page
- **Component Structure**:
  - Header with navigation and search bar
  - Hero section for welcome messaging
  - Movies grid for displaying film cards
  - Footer with copyright information

### Styling Approach
- **CSS Variables**: Custom properties for theming (colors defined in `:root`)
- **Design Theme**: Dark, Netflix-inspired color palette with red accent (`#e50914`)
- **Typography**: Google Fonts (Poppins) for modern, clean text rendering
- **Responsive Container**: Max-width container pattern for content centering

### Data Flow
- **API Integration**: Asynchronous data fetching from TMDB API
- **Dynamic Rendering**: JavaScript DOM manipulation to populate movie cards
- **Search Functionality**: Real-time search with API query parameters
- **Error Handling**: User-friendly messages for failed requests or empty results

### Language
- **Localization**: Turkish language interface (`lang="tr"`)
- **API Language Parameter**: TMDB queries use `language=tr-TR` for Turkish results

## External Dependencies

### APIs
- **The Movie Database (TMDB) API**
  - Base URL: `https://api.themoviedb.org/3`
  - Image CDN: `https://image.tmdb.org/t/p/w500`
  - Used for: Movie search, popular movies, movie metadata (titles, posters, ratings, release dates)
  - Authentication: API key-based

### External Resources
- **Google Fonts**: Poppins font family (weights: 300, 400, 600, 700)
- **Placeholder Images**: `via.placeholder.com` for missing movie posters

### No Backend Required
This is a client-side only application with no server component. All data is fetched directly from the TMDB API in the browser.