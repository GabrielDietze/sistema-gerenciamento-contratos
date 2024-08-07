// Bibliotecas
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Componentes
import Navbar from "../../componetes/navbar";
import Loading from "../../componetes/loading";
// Estilos, funcoes, classes, imagens e etc
import Api from "../../utils/api";
import './style.css';

export default function Clientes() {
    const api = new Api();
    const [clientes, setClientes] = useState([]);
    const [contratos, setContratos] = useState([]);
    const [filter, setFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const clientesResponse = await api.get('/clientes');
                setClientes(clientesResponse.clientes);

                const contratosResponse = await api.get('/contratos');
                setContratos(contratosResponse.contratos);
            } catch (err) {
                console.error("Error fetching data:", err);
            }
            finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const calculaValorImpostoMensal = (valor, indice) => valor + ((valor * indice) / 100);

    const calculaValorTotalContratos = (clienteId) => {
        const clienteContratos = contratos.filter(contrato => contrato.id_cliente === clienteId && contrato.status === 'ativo');
        const total = clienteContratos.reduce((sum, contrato) => sum + calculaValorImpostoMensal(parseFloat((contrato.valor_mensal * contrato.quantidade) * contrato.duracao), contrato.indice_reajuste), 0);

        return total;
    };

    const detalhesCliente = (id) => {
        navigate(`/clientes/${id}`);
    };

    const filtraClientes = (e) => {
        setFilter(e.target.value);
    };

    const clientesFiltrados = clientes.filter(cliente =>
        cliente.nome_fantasia.toLowerCase().includes(filter.toLowerCase())
    );

    const addCliente = () => {
        navigate('/cadastro-cliente');
    }

    return (
        <>
            {loading && <Loading />}
            <div id="clientes-display">
                <Navbar />
                <div id="clientes-container">
                    <h1 id="clientes-titulo">Clientes</h1>
                    <input
                        type="text"
                        placeholder="Procure pelo nome"
                        id="clientes-input"
                        value={filter}
                        onChange={filtraClientes}
                    />
                    <button onClick={e => addCliente()} id="clientes-botao">Adicionar cliente</button>
                    {clientesFiltrados.length > 0 ? (
                        <table id="clientes-tabela">
                            <thead>
                                <tr>
                                    <th className="clientes-titulo-tabela">Nome Fantasia</th>
                                    <th className="clientes-titulo-tabela">CPF/CNPJ</th>
                                    <th className="clientes-titulo-tabela">NPS</th>
                                    <th className="clientes-titulo-tabela">Valor Contratos</th>
                                    <th className="clientes-titulo-tabela">Data Cadastro</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clientesFiltrados.map(cliente => (
                                    <tr key={cliente.id} onClick={() => detalhesCliente(cliente.id)} className="clickable-row">
                                        <td className="clientes-conteudo-tabela">{cliente.nome_fantasia}</td>
                                        <td className="clientes-conteudo-tabela">{cliente.cpf_cnpj}</td>
                                        <td className="clientes-conteudo-tabela">{cliente.nps}</td>
                                        <td className="clientes-conteudo-tabela">{calculaValorTotalContratos(cliente.id).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                        <td className="clientes-conteudo-tabela">{new Date(cliente.data_criacao).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p id="clientes-sem-clientes">Ainda não foram cadastrados clientes!</p>
                    )}
                </div>
            </div>
        </>
    );
}
