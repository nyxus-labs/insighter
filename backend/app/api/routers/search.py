from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from typing import List, Optional, Any
from app.core.security import User, get_current_user
from app.db.supabase import SupabaseManager

router = APIRouter()

class SearchResult(BaseModel):
    id: str
    type: str  # project, dataset, notebook, model
    title: str
    description: Optional[str] = None
    url: str
    metadata: Optional[dict] = None

class SearchResponse(BaseModel):
    results: List[SearchResult]
    total: int

@router.get("/", response_model=SearchResponse)
async def search(
    q: str = Query(..., min_length=1, description="Search query"),
    type: Optional[str] = Query(None, description="Filter by type: project, dataset, notebook, model"),
    limit: int = 10,
    offset: int = 0,
    current_user: User = Depends(get_current_user)
):
    """
    Unified search across Projects, Datasets, Notebooks, and Models.
    """
    supabase = SupabaseManager.get_client()
    results = []
    
    # Define search queries for each entity type
    queries = []
    
    if not type or type == 'project':
        queries.append(('projects', 'name, description', 'project'))
    if not type or type == 'dataset':
        queries.append(('datasets', 'name, description', 'dataset'))
    if not type or type == 'notebook':
        queries.append(('notebooks', 'name, description', 'notebook'))
    if not type or type == 'model':
        queries.append(('models', 'name, version', 'model'))

    # Execute queries (naive implementation: sequential queries)
    # In a real production scenario, you might use a dedicated search index or Supabase text search
    
    for table, columns, entity_type in queries:
        try:
            # Using 'ilike' for simple case-insensitive search on name
            # Supabase-py syntax: table(table).select("*").ilike('name', f'%{q}%').execute()
            
            # Note: Complex OR logic (name OR description) requires Supabase 'or' filter syntax
            # filter=f"name.ilike.%{q}%,description.ilike.%{q}%"
            
            filter_str = f"name.ilike.%{q}%"
            if 'description' in columns:
                filter_str += f",description.ilike.%{q}%"
            
            response = supabase.table(table)\
                .select("*")\
                .or_(filter_str)\
                .eq('owner_id' if table == 'projects' else 'created_by' if table != 'projects' else 'owner_id', current_user.user_id)\
                .range(0, limit)\
                .execute()
                
            for item in response.data:
                results.append(SearchResult(
                    id=item['id'],
                    type=entity_type,
                    title=item['name'],
                    description=item.get('description') or item.get('version'),
                    url=f"/dashboard/{entity_type}s/{item['id']}" if entity_type != 'notebook' else f"/studio/{item.get('project_id')}/notebook/{item['id']}",
                    metadata={"updated_at": item.get('updated_at') or item.get('created_at')}
                ))
        except Exception as e:
            from app.core.logging import logger
            logger.error(f"Error searching {table}: {e}")
            continue

    # Manual pagination/limiting since we aggregate multiple queries
    # In a robust solution, we'd use a SQL UNION view or full-text search engine
    total = len(results)
    paginated_results = results[offset : offset + limit]

    return SearchResponse(results=paginated_results, total=total)
