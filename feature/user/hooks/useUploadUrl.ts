import { useAppSelector } from "@/lib/redux/hooks";

interface UploadUrlProps {
  fileName?: string;
}

export const UseUploadUrl = ({ fileName }: UploadUrlProps) => {
  const { ipAddress, port } = useAppSelector((state) => state.config);

  const imageUrl = `http://${ipAddress}:${port}/uploads/logs/${fileName}`;

  return { imageUrl };
};
