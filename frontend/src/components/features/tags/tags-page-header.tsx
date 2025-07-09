import { Search, Filter, Menu, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common/page-header"

interface TagsPageHeaderProps {
  tagCount: number
  onMobileSidebarToggle?: () => void
  onCreateTag: () => void
  onSearch?: () => void
  onFilter?: () => void
  className?: string
}

export function TagsPageHeader({ 
  tagCount, 
  onMobileSidebarToggle, 
  onCreateTag,
  onSearch,
  onFilter,
  className 
}: TagsPageHeaderProps) {
  const actions = (
    <>
      {onSearch && (
        <Button variant="outline" size="sm" onClick={onSearch}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      )}
      {onFilter && (
        <Button variant="outline" size="sm" onClick={onFilter}>
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      )}
      <Button onClick={onCreateTag}>
        <Plus className="w-4 h-4 mr-2" />
        Add Tag
      </Button>
    </>
  )

  return (
    <div className={className}>
      {/* Mobile Header */}
      <div className="flex items-center justify-between md:hidden mb-6">
        <div className="flex items-center gap-3">
          {onMobileSidebarToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMobileSidebarToggle}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold">Tags</h1>
            <p className="text-sm text-muted-foreground">
              {tagCount} {tagCount === 1 ? 'tag' : 'tags'}
            </p>
          </div>
        </div>
        <Button onClick={onCreateTag}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <PageHeader
          title="Tags"
          description={`Organize your tasks with ${tagCount} ${tagCount === 1 ? 'tag' : 'tags'}`}
          actions={actions}
        />
      </div>
    </div>
  )
}

export default TagsPageHeader