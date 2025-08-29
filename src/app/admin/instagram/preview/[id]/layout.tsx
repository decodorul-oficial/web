import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Instagram Preview - Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
