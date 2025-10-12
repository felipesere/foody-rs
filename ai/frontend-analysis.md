  Critical Issues & Bugs

  1. Race Condition in Recipe Changes (frontend/src/routes/_auth.recipes/$recipeId.tsx:153-155)
    - When saving changes, submitChanges.mutate({ changes }) is called followed immediately by setChanges([]), but there's no guarantee the mutation completes before navigation
    - If the mutation fails, the changes are already cleared and lost
    - Fix: Use mutateAsync with proper error handling or clear changes in onSuccess callback
  2. Unsafe Non-null Assertions (frontend/src/routes/_auth.recipes/$recipeId.tsx:175-188)
    - Using ! assertions on nullable fields (source.title!, source.page!, source.url!) after type checking
    - While the code checks source.source === "book", it doesn't verify the fields themselves are non-null
    - Fix: Add proper null checks or restructure the type system
  3. Inefficient Query Invalidation (frontend/src/apis/recipes.ts:229)
    - useChangeRecipe doesn't check if id exists before checking !vars.changes
    - Logic error: if (!id && !vars.changes) should probably be if (!id && !vars.recipeId)
    - Fix: Correct the validation logic
  4. Stale Closure in Input Component (frontend/src/components/smart/recipeView.tsx:491-514)
    - The Input component has local state that doesn't sync with parent prop changes
    - If parent value changes after component mounts, the input will show stale data
    - Fix: Add useEffect to sync local state when props change, or remove local state
  5. Missing Error Boundaries
    - No error boundaries around route components or major sections
    - Errors in child components will crash the entire app
    - Fix: Add React Error Boundaries at strategic points
  6. Uncaught Promise Rejections (multiple locations)
    - Several places use void form.handleSubmit() without error handling
    - useLogin logs errors to console but doesn't show user feedback beyond that
    - Fix: Add proper error handling and user feedback

  ---
  Data Management Issues

  7. Optimistic Update Inconsistency (frontend/src/apis/shoppinglists.ts:152-203)
    - useToggleIngredientInShoppinglist has sophisticated optimistic updates
    - Other mutations don't use optimistic updates, creating inconsistent UX
    - The onSuccess invalidation (line 198-202) duplicates the onSettled invalidation
    - Fix: Remove duplicate invalidation or clarify the intention
  8. No Debouncing on API Calls
    - Components like Dropdown trigger searches on every keystroke without debouncing
    - Can cause performance issues and excessive API calls
    - Fix: Add debouncing for search inputs
  9. Aggressive Polling (frontend/src/apis/shoppinglists.ts:77-78)
    - Shopping list refetches every 2 seconds even when in background
    - This could drain battery and waste bandwidth
    - Fix: Consider WebSockets or increase interval, disable background refetch
  10. Missing Query Key Consistency
    - Some queries use ["recipe", id], others use ["recipes"]
    - No centralized query key factory to prevent typos
    - Fix: Create a query key factory object for consistency

  ---
  Type Safety Issues

  11. Inconsistent Null vs Undefined (frontend/src/apis/recipes.ts:36-38)
    - Recipe schema uses nullable() for fields that should arguably be undefined
    - TODOs in code acknowledge this: // <-- TODO: this should be undefined!
    - Mixing null/undefined creates confusion and extra checks
    - Fix: Choose one approach and be consistent
  12. Weak Type in onChange (frontend/src/components/smart/recipeView.tsx:307)
    - onChange={() => {}} is a no-op but TypeScript doesn't catch this
    - Should remove the prop or implement it properly
  13. Any Type Leakage
    - Several places coerce types without proper validation
    - Example: value as string / value as number in Input component
    - Fix: Use proper type guards
  14. Missing Generic Constraints
    - Dropdown component uses T extends Named but doesn't enforce it strictly
    - Could cause runtime errors if items don't match

  ---
  Performance Issues

  15. Unnecessary Re-renders
    - RecipeView creates new functions on every render (all the on* callbacks)
    - No memoization of expensive computations
    - Fix: Use useCallback for callbacks passed to child components
  16. Inefficient Fuse.js Recreation (frontend/src/components/dropdown.tsx:61-67)
    - searchIndex is memoized, but only on props.items reference change
    - If items array is recreated (even with same contents), index rebuilds
    - Fix: Consider using a more stable dependency or deep comparison
  17. No Virtualization
    - Lists of recipes/ingredients aren't virtualized
    - Could cause performance issues with large datasets
    - Fix: Use @tanstack/react-virtual for long lists
  18. Missing React.memo
    - Many components that receive static props aren't memoized
    - Causes unnecessary re-renders
    - Fix: Wrap expensive components with React.memo

  ---
  State Management Issues

  19. Duplicate State (frontend/src/components/smart/recipeView.tsx:229, 368-372)
    - Components like Duration, ShowSource, and Name have local state that duplicates parent state
    - Causes sync issues and complexity
    - Fix: Lift state up or use controlled components consistently
  20. Context Misuse (frontend/src/components/popup.tsx:12-15)
    - PopupContext default values are empty strings/no-ops
    - If component used outside provider, fails silently
    - Fix: Throw error in default context or ensure provider wrapping
  21. Form State Not Persisted
    - Creating a new recipe: if user navigates away, all data is lost
    - No draft saving or "are you sure?" dialog
    - Fix: Add localStorage persistence or navigation guards

  ---
  User Experience Issues

  22. No Loading States for Mutations
    - Buttons don't show loading state during mutations
    - Users might click multiple times
    - Fix: Use isPending from mutation hooks to disable buttons
  23. Generic Error Messages
    - Error handling just logs to console or shows generic toast
    - Users don't know what went wrong or how to fix it
    - Fix: Provide specific, actionable error messages
  24. No Offline Support
    - App breaks when offline despite having query persistence
    - Fix: Add proper offline detection and queue mutations
  25. Accessibility Issues
    - Many interactive elements lack proper ARIA labels
    - Dropdown doesn't announce items to screen readers properly
    - No keyboard shortcuts documented
    - Fix: Add comprehensive ARIA attributes and keyboard navigation

  ---
  Code Quality Issues

  26. Inconsistent Error Handling
    - Some API calls use try/catch, others rely on mutation error handlers
    - No consistent pattern
    - Fix: Establish and document error handling patterns
  27. TODOs in Production Code (frontend/src/apis/recipes.ts:36-38, 50)
    - Multiple TODOs indicate incomplete features
    - UnstoredIngredient type is marked with "TODO! this needs to be very different!"
    - Fix: Address TODOs or create tickets to track them
  28. Tight Coupling to Token Prop
    - Every hook requires token parameter
    - Makes testing harder and creates prop drilling
    - Fix: Consider context or dedicated auth hook
  29. Magic Numbers (frontend/src/apis/user.ts:103, 124)
    - Hard-coded values like 2 * DAYS for token expiration
    - Fix: Extract to named constants or config
  30. Console.logs in Production (frontend/src/apis/user.ts:114, 131)
    - Multiple console.log statements will run in production
    - Fix: Use proper logging library or remove debug logs

  ---
  Security Concerns

  31. Token in LocalStorage (frontend/src/apis/user.ts:92)
    - JWT token stored in localStorage is vulnerable to XSS
    - Fix: Consider httpOnly cookies for auth tokens
  32. No CSRF Protection
    - API calls don't include CSRF tokens
    - Relies solely on bearer token
    - Fix: Implement CSRF protection for state-changing operations
  33. URL Validation Missing (frontend/src/components/smart/recipeView.tsx:458)
    - External links opened without validation
    - Could be exploited for XSS via javascript: URLs
    - Fix: Validate URLs before rendering links

  ---
  Testing Gaps

  34. Minimal Test Coverage
    - Only one test file found: dropdown.test.tsx
    - No tests for critical paths like authentication, recipe creation
    - Fix: Add comprehensive test coverage
  35. No Integration Tests
    - Individual components may work but integration could fail
    - Fix: Add integration tests for key user flows

  ---
  Architectural Improvements

  36. Missing API Layer Abstraction
    - HTTP client (ky) is used directly in hooks
    - Makes mocking difficult for tests
    - Fix: Create an API client layer
  37. No Request Deduplication
    - Multiple components requesting same data might cause duplicate requests
    - TanStack Query handles some of this, but not all
    - Fix: Ensure proper query key usage
  38. Hardcoded API URLs (frontend/src/apis/http.ts:4-15)
    - Production URL is hardcoded: https://foody.felipesere.com
    - Fix: Use environment variables

  ---
  Recommendations Summary

  High Priority:
  - Fix race condition in recipe saving
  - Add error boundaries
  - Implement proper error handling and user feedback
  - Remove unsafe non-null assertions
  - Fix input component stale closure bug

  Medium Priority:
  - Reduce polling frequency or use WebSockets
  - Add optimistic updates consistently
  - Implement request debouncing
  - Add loading states for all mutations
  - Improve accessibility

  Low Priority:
  - Refactor to use useCallback/useMemo for performance
  - Clean up TODOs
  - Add comprehensive testing
  - Extract magic numbers to constants
  - Remove console.logs

  The codebase is well-structured overall with good use of TanStack Router and Query. The main areas needing attention are error handling, performance optimizations, and completing the TODOs marked in the code.

