import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
    // Before loading, authenticate the user via data in the query cache
    // This will also happen during prefetching (e.g. hovering over links, etc)
    beforeLoad: ({ context, location }) => {
        // If the user is logged out, redirect them to the login page
        const profile = context.queryClient.getQueryData(["user", "profile"])
        console.log("Checking if user is present...")
        if (!profile) {
            throw redirect({
                to: '/login',
                search: {
                    redirect: location.href,
                },
            })
        }

        // Otherwise, return the user in context
        return {
            profile,
        }
    },
})
