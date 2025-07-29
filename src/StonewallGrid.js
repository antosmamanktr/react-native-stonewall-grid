import React, { useEffect, useState } from "react";
import { Dimensions, View, Image } from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const imageSizeCache = {};

function getImageSize(source) {
  return new Promise((resolve, reject) => {
    if (typeof source === "number") {
      const { width, height } = Image.resolveAssetSource(source);
      resolve({ width, height });
    } else if (typeof source === "string") {
      if (imageSizeCache[source]) {
        resolve(imageSizeCache[source]);
      } else {
        Image.getSize(
          source,
          (width, height) => {
            imageSizeCache[source] = { width, height };
            resolve({ width, height });
          },
          (error) => reject(error)
        );
      }
    } else if (source?.uri) {
      const uri = source.uri;
      if (imageSizeCache[uri]) {
        resolve(imageSizeCache[uri]);
      } else {
        Image.getSize(
          uri,
          (width, height) => {
            imageSizeCache[uri] = { width, height };
            resolve({ width, height });
          },
          (error) => reject(error)
        );
      }
    } else {
      reject(new Error("Invalid image source"));
    }
  });
}

const StonewallGrid = ({
  data = [],
  renderItem,
  columns = 2,
  horizontalSpacing = 12,
  verticalSpacing = 12,
  preserveOrder = false,
  imageFields = ["source"], // <- accepts multiple image keys
}) => {
  const [columnsData, setColumnsData] = useState([]);

  useEffect(() => {
    const prepareGrid = async () => {
      const columnHeights = Array(columns).fill(0);
      const tempColumns = Array.from({ length: columns }, () => []);
      const columnWidth =
        (screenWidth - horizontalSpacing * (columns - 1)) / columns;

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
              (typeof value === "object" && value.uri))
          ) {
            try {
              const resolvedSource =
                typeof value === "string" ? { uri: value } : value;
              const { width, height } = await getImageSize(resolvedSource);
              const scaledHeight = (height / width) * columnWidth;

              // Assign back as { image, height }
              modifiedItem[field] = {
                image: value,
                height: scaledHeight,
              };

              // Use first valid height for sorting
              if (!firstValidHeight) {
                firstValidHeight = scaledHeight;
              }
            } catch (err) {}
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
  }, [
    data,
    columns,
    horizontalSpacing,
    verticalSpacing,
    preserveOrder,
    imageFields,
  ]);

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
            <View
              key={item.id ?? index}
              style={{ marginBottom: verticalSpacing }}
            >
              {renderItem({ item })}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

export default StonewallGrid;
