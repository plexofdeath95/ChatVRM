import { create } from "zustand";

// Define types for the metadata
export interface ObjectMetadata {
  id: string; // Unique identifier for the object
  position: {
    x: number;
    y: number;
    z: number;
  }; // World position
  rotation: {
    x: number;
    y: number;
    z: number;
  }; // Rotation
  recentlyInteracted: boolean; // Whether the object was recently interacted with
  neighbors?: NeighborMetadata[]; // List of neighboring objects with relative positions
}

export interface NeighborMetadata {
  id: string; // Neighbor object ID
  relativePosition: {
    x: number;
    y: number;
    z: number;
    description: string; // Detailed description (e.g., "above and far away")
  };
  distance: number; // Euclidean distance to the neighbor
}

// Define the state and actions for the store
interface InteractableStore {
  objects: Record<string, ObjectMetadata>; // A dictionary of object metadata, keyed by object ID
  addObject: (object: ObjectMetadata) => void; // Add a new object
  updateObject: (id: string, updates: Partial<ObjectMetadata>) => void; // Update an existing object
  removeObject: (id: string) => void; // Remove an object by ID
  clearInteractions: () => void; // Reset all recentlyInteracted flags
  updateNeighbors: () => void; // Update neighbors for all objects
}

// Helper function to calculate the Euclidean distance
const calculateDistance = (pos1: { x: number; y: number; z: number }, pos2: { x: number; y: number; z: number }) => {
  return Math.sqrt(
    Math.pow(pos2.x - pos1.x, 2) +
    Math.pow(pos2.y - pos1.y, 2) +
    Math.pow(pos2.z - pos1.z, 2)
  );
};

// Helper function to determine direction and range
const determineDescription = (relativePosition: { x: number; y: number; z: number }, distance: number): string => {
  let range = "near";
  if (distance > 10 && distance <= 20) range = "medium";
  else if (distance > 20) range = "far";

  let vertical = "";
  if (relativePosition.y > 0) vertical = "above";
  else if (relativePosition.y < 0) vertical = "under";

  let horizontal = "";
  if (relativePosition.x > 0 && relativePosition.z > 0) horizontal = "in front and to the right";
  else if (relativePosition.x < 0 && relativePosition.z > 0) horizontal = "in front and to the left";
  else if (relativePosition.x > 0 && relativePosition.z < 0) horizontal = "behind and to the right";
  else if (relativePosition.x < 0 && relativePosition.z < 0) horizontal = "behind and to the left";
  else if (relativePosition.z > 0) horizontal = "in front";
  else if (relativePosition.z < 0) horizontal = "behind";

  const components = [vertical, range, horizontal].filter(Boolean);
  return components.join(" and ");
};

// Create the Zustand store
export const useInteractableStore = create<InteractableStore>((set, get) => ({
  objects: {},

  addObject: (object) =>
    set((state) => {
      const updatedObjects = { ...state.objects, [object.id]: object };
      const neighborsToUpdate = Object.entries(updatedObjects).map(([id, targetObject]) => {
        const neighbors = Object.entries(updatedObjects)
          .filter(([neighborId]) => neighborId !== id)
          .map(([neighborId, neighborObject]) => {
            const relativePosition = {
              x: neighborObject.position.x - targetObject.position.x,
              y: neighborObject.position.y - targetObject.position.y,
              z: neighborObject.position.z - targetObject.position.z,
            };
            const distance = calculateDistance(targetObject.position, neighborObject.position);
            const description = determineDescription(relativePosition, distance);
            return {
              id: neighborId,
              relativePosition: {
                ...relativePosition,
                description,
              },
              distance,
            };
          });
        return [id, { ...targetObject, neighbors }];
      });
      return {
        objects: Object.fromEntries(neighborsToUpdate),
      };
    }),

	updateObject: (id, updates) =>
		set((state) => {
		  const existingObject = state.objects[id];
		  if (!existingObject) return state;
	  
		  const updatedObject = { ...existingObject, ...updates };
		  const updatedObjects = { ...state.objects, [id]: updatedObject };
	  
		  const neighbors = Object.entries(updatedObjects)
			.filter(([neighborId]) => neighborId !== id)
			.map(([neighborId, neighborObject]) => {
			  const relativePosition = {
				x: neighborObject.position.x - updatedObject.position.x,
				y: neighborObject.position.y - updatedObject.position.y,
				z: neighborObject.position.z - updatedObject.position.z,
			  };
			  const distance = calculateDistance(updatedObject.position, neighborObject.position);
			  const description = determineDescription(relativePosition, distance);
			  return {
				id: neighborId,
				relativePosition: {
				  ...relativePosition,
				  description,
				},
				distance,
			  };
			});
	  
		  // Format for LLM
		  const formattedNeighbors = neighbors.map((neighbor) => ({
			id: neighbor.id,
			distance: neighbor.distance.toFixed(2),
			description: neighbor.relativePosition.description,
		  }));
	  
		  // Update the object with neighbors
		  updatedObjects[id] = { ...updatedObject, neighbors };
	  
		  console.log(`Updated neighbors for ${id}:`, formattedNeighbors); // Log for debugging/validation
	  
		  return {
			objects: updatedObjects,
		  };
		}),
	  
  removeObject: (id) =>
    set((state) => {
      const newObjects = { ...state.objects };
      delete newObjects[id];

      const neighborsToUpdate = Object.entries(newObjects).map(([id, targetObject]) => {
        const neighbors = Object.entries(newObjects)
          .filter(([neighborId]) => neighborId !== id)
          .map(([neighborId, neighborObject]) => {
            const relativePosition = {
              x: neighborObject.position.x - targetObject.position.x,
              y: neighborObject.position.y - targetObject.position.y,
              z: neighborObject.position.z - targetObject.position.z,
            };
            const distance = calculateDistance(targetObject.position, neighborObject.position);
            const description = determineDescription(relativePosition, distance);
            return {
              id: neighborId,
              relativePosition: {
                ...relativePosition,
                description,
              },
              distance,
            };
          });
        return [id, { ...targetObject, neighbors }];
      });

      return {
        objects: Object.fromEntries(neighborsToUpdate),
      };
    }),

  clearInteractions: () =>
    set((state) => ({
      objects: Object.fromEntries(
        Object.entries(state.objects).map(([id, object]) => [
          id,
          { ...object, recentlyInteracted: false },
        ])
      ),
    })),

  updateNeighbors: () =>
    set((state) => {
      const updatedObjects = Object.fromEntries(
        Object.entries(state.objects).map(([id, targetObject]) => {
          const neighbors = Object.entries(state.objects)
            .filter(([neighborId]) => neighborId !== id)
            .map(([neighborId, neighborObject]) => {
              const relativePosition = {
                x: neighborObject.position.x - targetObject.position.x,
                y: neighborObject.position.y - targetObject.position.y,
                z: neighborObject.position.z - targetObject.position.z,
              };
              const distance = calculateDistance(targetObject.position, neighborObject.position);
              const description = determineDescription(relativePosition, distance);
              return {
                id: neighborId,
                relativePosition: {
                  ...relativePosition,
                  description,
                },
                distance,
              };
            });

          return [
            id,
            {
              ...targetObject,
              neighbors,
            },
          ];
        })
      );

      return {
        objects: updatedObjects,
      };
    }),
}));
