import {createFileRoute} from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/tags/')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div className="content-grid space-y-4">
            <p>Hello tags!</p>
        </div>
    )
}
