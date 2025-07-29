import React, { useEffect, useState } from "react";
import {
  Dimensions,
  View,
  Image,
  ImageSourcePropType,
  ViewStyle,
} from "react-native";

const { width: screenWidth } = Dimensions.get("window");

// Cache to prevent repeated image resolution
const imageSizeCache: Record<string, { width: number; height: number }> = {};

// Helper to get image size from various source types
function getImageSize(source: ImageSourcePropType): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    if (typeof source === "number") {
      const resolved = Image.resolveAssetSource(source);
      if (resolved?.width && resolved?.height) {
        resolve({ width: resolved.width, height: resolved.height });
      } else {
        reject(new Error("Failed to resolve local image asset"));
      }
    } else if (typeof source === "string") {
      if (imageSizeCache[source]) return resolve(imageSizeCache[source]);
      Image.getSize(
        source,
        (width, height) => {
          imageSizeCache[source] = { width, height };
          resolve({ width, height });
        },
        reject
      );
    } else if (
      typeof source === "object" &&
      !Array.isArray(source) &&
      source !== null &&
      "uri" in source &&
      typeof (source as { uri: unknown }).uri === "string"
    ) {
      const uri = (source as { uri: string }).uri;
      if (imageSizeCache[uri]) return resolve(imageSizeCache[uri]);
      Image.getSize(
        uri,
        (width, height) => {
          imageSizeCache[uri] = { width, height };
          resolve({ width, height });
        },
        reject
      );
    } else {
      reject(new Error("Invalid image source"));
    }
  });
}

// Props interface for the grid component
export interface StonewallGridProps<T = any> {
  data: T[];
  renderItem: (info: { item: T }) => React.ReactElement;
  columns?: number;
  horizontalSpacing?: number;
  verticalSpacing?: number;
  preserveOrder?: boolean;
  imageFields?: (keyof T)[];
}

// Main component
const StonewallGrid = <T extends { [key: string]: any }>({
  data = [],
  renderItem,
  columns = 2,
  horizontalSpacing = 12,
  verticalSpacing = 12,
  preserveOrder = false,
  imageFields = ["source"],
}: StonewallGridProps<T>) => {
  const [columnsData, setColumnsData] = useState<T[][]>([]);

  useEffect(() => {
    const prepareGrid = async () => {
      const columnHeights = Array(columns).fill(0);
      const tempColumns = Array.from({ length: columns }, () => [] as T[]);
      const columnWidth = (screenWidth - horizontalSpacing * (columns - 1)) / columns;

      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const modifiedItem = { ...item };
        let firstValidHeight = 0;

        for (const field of imageFields) {
          const value = item[field];
          if (
            value &&
            (typeof value === "number" ||
              typeof value === "string" ||
              (typeof value === "object" &&
                (value as { uri?: string }).uri))
          ) {
            try {
              const resolvedSource =
                typeof value === "string" ? { uri: value } : value;
              const { width, height } = await getImageSize(resolvedSource);
              const scaledHeight = (height / width) * columnWidth;

              // Cast to any to bypass T[key] strict typing issue
              (modifiedItem as any)[field] = {
                image: value,
                height: scaledHeight,
              };

              if (!firstValidHeight) {
                firstValidHeight = scaledHeight;
              }
            } catch (err) {
              // Ignore image load failures
            }
          }
        }

        const columnIndex = preserveOrder
          ? i % columns
          : columnHeights.indexOf(Math.min(...columnHeights));

        columnHeights[columnIndex] += firstValidHeight + verticalSpacing;
        tempColumns[columnIndex].push(modifiedItem);
      }

      setColumnsData(tempColumns);
    };

    prepareGrid();
  }, [data, columns, horizontalSpacing, verticalSpacing, preserveOrder, imageFields]);

  return (
    <View style={{ flexDirection: "row", paddingHorizontal: 2 }}>
      {columnsData.map((columnItems, colIndex) => (
        <View
          key={`col-${colIndex}`}
          style={{
            flex: 1,
            marginLeft: colIndex === 0 ? 0 : horizontalSpacing / 2,
            marginRight: colIndex === columns - 1 ? 0 : horizontalSpacing / 2,
          }}
        >
          {columnItems.map((item, index) => (
            <View key={(item as any).id ?? index} style={{ marginBottom: verticalSpacing }}>
              {renderItem({ item })}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

export default StonewallGrid;
