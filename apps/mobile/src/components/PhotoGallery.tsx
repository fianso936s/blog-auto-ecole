import { ModalFrame } from "./ModalFrame";
import React, { useEffect } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import type { Point } from "@repere/core";
import { Button } from "./UI";
import { colors } from "../theme";

export function PhotoGallery({
  photos,
  index,
  onIndex,
  onClose,
  onViewed,
  title,
}: {
  photos: Point["photos"];
  index: number;
  onIndex: (index: number) => void;
  onClose: () => void;
  onViewed?: (id: string) => void;
  title: string;
}) {
  const { width, height } = useWindowDimensions();
  const photo = photos[index];
  useEffect(() => {
    if (photo && index >= 0) onViewed?.(photo.id);
  }, [photo?.id, index, onViewed]);
  return (
    <Modal
      visible={index >= 0 && !!photo}
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <ModalFrame style={{ backgroundColor: colors.ink }}>
        <View style={{ padding: 16, gap: 12 }}>
          <Button label="Fermer la photo" secondary onPress={onClose} />
          <Text style={{ color: colors.paper, textAlign: "center", fontSize: 15 }}>
            {index + 1} / {photos.length} · {title}
          </Text>
        </View>
        <ScrollView
          key={photo?.id}
          maximumZoomScale={6}
          minimumZoomScale={1}
          centerContent
          bouncesZoom
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        >
          {photo && (
            <Image
              source={{ uri: photo.dataUrl }}
              accessibilityLabel={
                photo.caption || `Photo ${index + 1} du repère ${title}`
              }
              resizeMode="contain"
              style={{ width, height: Math.max(200, height - 240) }}
            />
          )}
        </ScrollView>
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ color: colors.line, textAlign: "center" }}>
            {photo?.caption ||
              "Pincez avec deux doigts pour examiner les détails."}
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Button
                label="Précédente"
                secondary
                disabled={index <= 0}
                onPress={() => onIndex(index - 1)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label="Suivante"
                secondary
                disabled={index >= photos.length - 1}
                onPress={() => onIndex(index + 1)}
              />
            </View>
          </View>
        </View>
      </ModalFrame>
    </Modal>
  );
}
