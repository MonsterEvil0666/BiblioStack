import Link from "next/link";
import Image from "next/image";
import { FaBook, FaUser, FaTags } from "react-icons/fa";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black text-white">
      {/* Header Section */}
      <header className="flex flex-col items-center mb-8">
        <Image
          src="/BiblioStackIco.png"
          alt="BiblioStack Logo"
          width={300}
          height={250}
          className="mb-4"
        />
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-green-500 to-purple-500">
          BiblioStack
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Gerencie seu acervo de forma simples e eficiente.
        </p>
      </header>

      {/* Main Links Section */}
      <main className="flex flex-col gap-6 w-full max-w-xs sm:max-w-md">
        <Link
          href="/cadastro/biblioteca"
          className="flex flex-col items-center bg-blue-500 p-4 rounded-lg shadow-lg hover:bg-blue-600 transition text-center text-white"
        >
          <FaBook className="text-3xl mb-2" />
          <span className="text-lg font-semibold">Acessar Biblioteca</span>
        </Link>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 w-full">
          <Link
            href="/cadastro/autores"
            className="flex flex-col items-center bg-green-500 p-4 rounded-lg shadow-lg hover:bg-green-600 transition text-center text-white"
          >
            <FaUser className="text-3xl mb-2" />
            <span className="text-lg font-semibold">Autores</span>
          </Link>

          <Link
            href="/cadastro/generos"
            className="flex flex-col items-center bg-purple-500 p-4 rounded-lg shadow-lg hover:bg-purple-600 transition text-center text-white"
          >
            <FaTags className="text-3xl mb-2" />
            <span className="text-lg font-semibold">Gêneros</span>
          </Link>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="mt-12 text-sm text-gray-500">
        Desenvolvido por sua equipe acadêmica. © 2024
      </footer>
    </div>
  );
}
