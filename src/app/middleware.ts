import { NextResponse } from 'next/server';
import { auth } from './firebase/firebase'; // Make sure you have firebase config here
import { onAuthStateChanged } from 'firebase/auth';

export async function middleware(req: Request) {
  // Get current user authentication state
  const currentUser = await new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => resolve(user));
  });

  // List of pages that need authentication
  const restrictedPaths = ['/products', '/user'];

  // Check if the current path is restricted
  const isRestricted = restrictedPaths.some((path) =>
    req.url.includes(path)
  );

  if (isRestricted && !currentUser) {
    // If not logged in and trying to access restricted pages, redirect to homepage
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

// Define the paths for which the middleware will be executed
export const config = {
  matcher: ['/products', '/user', '/'], // add any other paths you want to protect
};
