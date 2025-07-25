# URL Analyzer (Frontend)

## Overview
URL Analyzer is a frontend web application that enables users to submit URLs for analysis and view webpage metadata, such as HTML version, heading counts, internal and external links, broken links, and login form presence. The interface features a clean, responsive dashboard with real-time table updates, authentication, and a modern design using muted blues/greens, navy text, and a white background.

## Features
- **URL Submission**: Submit URLs via a centered form with a long input field and a "Send" button.
- **Dashboard**: Displays analysis results in a paginated, sortable, and filterable table.
- **Details Modal**: Shows detailed analysis, including a donut chart for internal vs. external links and a list of broken links (if available).
- **Real-Time Updates**: Table updates automatically after submitting a new URL.
- **Authentication**: Secure login and registration with error handling.
- **Responsive Design**: Optimized for both desktop and mobile devices, with form elements stacking vertically on smaller screens.

## Technologies
- **React**: JavaScript library for building the user interface.
- **TypeScript**: Ensures type safety and enhances developer experience.
- **Styled-Components**: CSS-in-JS and MUI.
- **React-ChartJS-2 & Chart.js**: Renders donut charts in the details modal for link analysis.
- **Node.js & npm**: Manages frontend dependencies and runs the development server.

## Pages
- **Login Page** (`/login`):
  - Users enter a username and password to log in.
  - Displays an error message for invalid credentials.
  - Redirects to the dashboard upon successful login.
- **Register Page** (`/register`):
  - Allows new users to create an account with a username and password.
  - Shows an error for duplicate usernames or invalid inputs.
- **Dashboard Page** (`/dashboard`):
  - Main interface for submitting URLs and viewing results.
  - Features a centered "Submit a URL" title, a long input field, and a "Send" button positioned to the right.
  - Includes a table with columns for title, HTML version, internal links, external links, broken links, and creation date.
  - Supports sorting by column, filtering by title, and pagination.
  - Clicking a table row opens a modal with a donut chart and broken links details.
  - Protected route, accessible only to authenticated users (redirects to login if unauthorized).

## Login and Register
- **Login**:
  - Users enter credentials on the `/login` page.
  - Successful login redirects to the `/dashboard` page.
  - Invalid credentials display an error message below the form.
- **Register**:
  - Users create an account on the `/register` page with a username and password.
  - Successful registration redirects to the `/login` page with a success message.
  - Errors (e.g., duplicate username) are displayed below the form.
- **Security**:
  - Authentication uses tokens stored in localStorage.
  - Tokens are cleared on sign-out, redirecting to the `/login` page.



