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
  lastInteractedId: string | null; // Add this line
  addObject: (object: ObjectMetadata) => void; // Add a new object
  updateObject: (id: string, updates: Partial<ObjectMetadata>) => void; // Update an existing object
  removeObject: (id: string) => void; // Remove an object by ID
  clearInteractions: () => void; // Reset all recentlyInteracted flags
  updateNeighbors: () => void; // Update neighbors for all objects
  setLastInteracted: (id: string | null) => void; // Add this line
  getLastInteractedDescription: () => string | null;
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
  if (distance > 2 && distance <= 3) range = "medium distance";
  else if (distance > 3) range = "far distance";

  let vertical = "";
  if (relativePosition.y > 0) vertical = "";
  else if (relativePosition.y < 0) vertical = "";

  let horizontal = "";
  if (relativePosition.x > 0 && relativePosition.z > 0) horizontal = "in front and to the right";
  else if (relativePosition.x < 0 && relativePosition.z > 0) horizontal = "in front and to the left";
  else if (relativePosition.x > 0 && relativePosition.z < 0) horizontal = "behind and to the right";
  else if (relativePosition.x < 0 && relativePosition.z < 0) horizontal = "behind and to the left";
  else if (relativePosition.z > 0) horizontal = "in front";
  else if (relativePosition.z < 0) horizontal = "behind";

  const components = [vertical, range, horizontal].filter(Boolean);
  return components.join(",");
};

// Create the Zustand store
export const useInteractableStore = create<InteractableStore>((set, get) => ({
  objects: {},
  lastInteractedId: null, // Add this line

  addObject: (object) =>
    set((state) => {
      // If object already exists, return current state unchanged
      if (state.objects[object.id]) {
        console.log(`Object ${object.id} already exists, skipping add`);
        return state;
      }

      console.log(`Adding new object:`, object);
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
      console.log(existingObject);
		  // Compare current values with updates to prevent unnecessary updates
		  const hasChanges = Object.entries(updates).some(([key, value]) => {
			if (key === 'position' || key === 'rotation') {
			  return Object.entries(value as Record<string, number>).some(
				([axis, val]) => (existingObject[key as keyof ObjectMetadata] as Record<string, number>)[axis] !== val
			  );
			}
			// Type guard to ensure key exists on existingObject
			return key in existingObject && existingObject[key as keyof ObjectMetadata] !== value;
		  });
	  
		  if (!hasChanges) return state;
		  const updatedObject = { ...existingObject, ...updates };
		  const updatedObjects = { ...state.objects, [id]: updatedObject };
	  
		  // Calculate neighbors only if position changed
		  if (updates.position) {
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
	  
			updatedObjects[id] = { ...updatedObject, neighbors };
		  }
	  
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
      lastInteractedId: null,
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

  setLastInteracted: (id) => set({ lastInteractedId: id }),

  getLastInteractedDescription: () => {
    const state = get();
    if (!state.lastInteractedId || !state.objects[state.lastInteractedId]) {
      return null;
    }

    const object = state.objects[state.lastInteractedId];
    const neighborDescriptions = object.neighbors
      ?.map(neighbor => `${neighbor.id}: - ${neighbor.relativePosition.description} relative to ${object.id} `)
      .join('\n');

    return `user just moved the ${object.id}.

These objects are around me:
${neighborDescriptions || 'No nearby objects found.'}, tell them what you think about how they placed ${object.id} relative to the other objects, DONT suggest new objects that you arent aware of. Use object names please when refering to them and use proper english.`;
  },
}));
