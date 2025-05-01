# Architex Project Improvement Report

## Chosen Use Case or Feature to Improve

I chose to implement the AI powered recommendation use case because that represents a big part of the project's logic as it would nehance the user's experience. 

## 🔍 Original Definition

the original use case: 
Use Case 4: Get AI-Powered Style Recommendation

Flow: The user opens a style and add it to favorite.
Outcome: The user receives a personalized recommendation that includes actionable design rules and characteristics.

## 🔄 Implementation

I implemented a dynamic alternative of the homepage's Featured Styles section that adapts based on the user's authentication status:

### For Non-Authenticated Users:
- The original static "Featured Styles" section remains, showcasing three pre-selected architectural styles
- Serves as an introduction to the application's content
- Encourages users to register for a personalized experience

### For Authenticated Users:
- The section transforms into "Recommended For You"
- Displays architectural styles similar to the user's favorites, based on time periods
- When a user adds a recommendation to their favorites, it's immediately replaced with a new recommendation

### Technical Changes Required:

1. **Backend Recommendation Engine**:
   - Created a recommendation service that analyzes architectural style time periods
   - Implemented intelligent parsing of various time period formats (e.g., "19th Century", "1920s-1930s")
   - Developed algorithms to calculate similarity between different time periods
   - Added scoring mechanisms to rank potential recommendations

2. **New API Endpoints**:
   - Created `/api/styles/recommendations` endpoint to fetch personalized recommendations
   - Implemented `/api/styles/recommendations/replacement` endpoint to get a single new recommendation when needed
   - Added query parameters to exclude already shown recommendations

3. **Frontend Components**:
   - Added UI for recommendation display and interaction
   - Implemented dynamic updates when recommendations are added to favorites

### Technologies, Methods and Structures Used:

1. **Content-Based Filtering**:
   - Implemented a lightweight machine learning approach (content-based filtering)
   - Created similarity metrics for comparing architectural styles
   - Used feature extraction and scoring algorithms

2. **Asynchronous State Management**:
   - Used React's `useEffect` and `useState` hooks with dependency arrays for selective re-rendering
   - Implemented `useCallback` for memoized functions that trigger API calls

3. **Dynamic UI Patterns**:
   - Implemented conditional rendering based on authentication status
   - Created smooth transitions for recommendations replacement
   - Added visual feedback for user interactions

4. **Backend Architecture**:
   - Used service-based architecture to separate recommendation logic from route handlers
   - Implemented parameterized API endpoints with query options
   - Created helper functions for time period analysis and comparison

### Challenges and Solutions:

1. **Challenge**: Route Order Conflicts
   - **Problem**: The `/api/styles/recommendations` route conflicted with the existing `/:id` route
   - **Solution**: Reorganized routes to ensure more specific routes are defined before parameterized routes

2. **Challenge**: Time Period Parsing
   - **Problem**: Architectural style time periods are written in various formats
   - **Solution**: Created a robust parsing function that can handle different notations (centuries, decades, year ranges)

3. **Challenge**: Recommendations Depletion
   - **Problem**: Users could exhaust all recommendations by adding many to favorites
   - **Solution**: Implemented proper error handling for when no more recommendations are available