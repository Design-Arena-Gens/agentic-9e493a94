'use client'

import { useState } from 'react'
import { Calculator, Users, FileText, DollarSign, Download } from 'lucide-react'

interface Employee {
  id: string
  nom: string
  prenom: string
  salaireBrut: number
  situationFamiliale: 'celibataire' | 'marie' | 'divorce' | 'veuf'
  nombreEnfants: number
  categorie: 'salarie' | 'cadre'
}

interface PayrollResult {
  salaireBrut: number
  cotisationsCNAS: number
  cotisationRetraite: number
  assuranceChomage: number
  totalCotisationsSalariales: number
  salaireImposable: number
  irg: number
  salaireNet: number
  employerCNAS: number
  employerRetraite: number
  employerChomage: number
  totalChargesPatronales: number
  coutTotal: number
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'calculate' | 'employees' | 'reports'>('calculate')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [currentEmployee, setCurrentEmployee] = useState<Employee>({
    id: '',
    nom: '',
    prenom: '',
    salaireBrut: 0,
    situationFamiliale: 'celibataire',
    nombreEnfants: 0,
    categorie: 'salarie'
  })
  const [payrollResult, setPayrollResult] = useState<PayrollResult | null>(null)

  const calculatePayroll = (employee: Employee): PayrollResult => {
    const salaireBrut = employee.salaireBrut

    // Cotisations salariales (déduites du salaire brut)
    const cotisationsCNAS = salaireBrut * 0.09 // 9% CNAS
    const cotisationRetraite = salaireBrut * 0.0925 // 9.25% retraite
    const assuranceChomage = salaireBrut * 0.005 // 0.5% assurance chômage
    const totalCotisationsSalariales = cotisationsCNAS + cotisationRetraite + assuranceChomage

    // Salaire imposable
    const salaireImposable = salaireBrut - totalCotisationsSalariales

    // Calcul IRG (Impôt sur le Revenu Global) - Barème 2024
    let irg = 0
    let revenuNetImposable = salaireImposable

    // Abattement selon situation familiale
    if (employee.situationFamiliale === 'marie') {
      revenuNetImposable -= 1000 // Abattement pour conjoint
    }
    revenuNetImposable -= employee.nombreEnfants * 500 // Abattement par enfant à charge

    // Application du barème progressif IRG
    if (revenuNetImposable <= 30000) {
      irg = 0
    } else if (revenuNetImposable <= 120000) {
      irg = (revenuNetImposable - 30000) * 0.20
    } else if (revenuNetImposable <= 360000) {
      irg = (120000 - 30000) * 0.20 + (revenuNetImposable - 120000) * 0.30
    } else {
      irg = (120000 - 30000) * 0.20 + (360000 - 120000) * 0.30 + (revenuNetImposable - 360000) * 0.35
    }

    // Salaire net à payer
    const salaireNet = salaireImposable - irg

    // Charges patronales
    const employerCNAS = salaireBrut * 0.125 // 12.5% CNAS patronale
    const employerRetraite = salaireBrut * 0.1025 // 10.25% retraite patronale
    const employerChomage = salaireBrut * 0.01 // 1% assurance chômage patronale
    const totalChargesPatronales = employerCNAS + employerRetraite + employerChomage

    // Coût total pour l'employeur
    const coutTotal = salaireBrut + totalChargesPatronales

    return {
      salaireBrut,
      cotisationsCNAS,
      cotisationRetraite,
      assuranceChomage,
      totalCotisationsSalariales,
      salaireImposable,
      irg,
      salaireNet,
      employerCNAS,
      employerRetraite,
      employerChomage,
      totalChargesPatronales,
      coutTotal
    }
  }

  const handleCalculate = () => {
    const result = calculatePayroll(currentEmployee)
    setPayrollResult(result)
  }

  const handleAddEmployee = () => {
    if (currentEmployee.nom && currentEmployee.prenom && currentEmployee.salaireBrut > 0) {
      const newEmployee = { ...currentEmployee, id: Date.now().toString() }
      setEmployees([...employees, newEmployee])
      setCurrentEmployee({
        id: '',
        nom: '',
        prenom: '',
        salaireBrut: 0,
        situationFamiliale: 'celibataire',
        nombreEnfants: 0,
        categorie: 'salarie'
      })
      setPayrollResult(null)
      alert('Employé ajouté avec succès!')
    }
  }

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id))
  }

  const exportToCSV = () => {
    if (employees.length === 0) {
      alert('Aucun employé à exporter')
      return
    }

    const headers = ['Nom', 'Prénom', 'Salaire Brut', 'Cotisations', 'IRG', 'Salaire Net', 'Charges Patronales', 'Coût Total']
    const rows = employees.map(emp => {
      const result = calculatePayroll(emp)
      return [
        emp.nom,
        emp.prenom,
        result.salaireBrut.toFixed(2),
        result.totalCotisationsSalariales.toFixed(2),
        result.irg.toFixed(2),
        result.salaireNet.toFixed(2),
        result.totalChargesPatronales.toFixed(2),
        result.coutTotal.toFixed(2)
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `paie_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Calculator className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion de Paie</h1>
              <p className="text-sm text-gray-600">Système conforme à la législation algérienne</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('calculate')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'calculate'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calculator className="w-5 h-5" />
              Calculateur
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'employees'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-5 h-5" />
              Employés ({employees.length})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'reports'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-5 h-5" />
              Rapports
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'calculate' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={currentEmployee.nom}
                      onChange={(e) => setCurrentEmployee({ ...currentEmployee, nom: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Nom de famille"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      value={currentEmployee.prenom}
                      onChange={(e) => setCurrentEmployee({ ...currentEmployee, prenom: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Prénom"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salaire Brut (DZD)
                    </label>
                    <input
                      type="number"
                      value={currentEmployee.salaireBrut || ''}
                      onChange={(e) => setCurrentEmployee({ ...currentEmployee, salaireBrut: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Situation Familiale
                    </label>
                    <select
                      value={currentEmployee.situationFamiliale}
                      onChange={(e) => setCurrentEmployee({ ...currentEmployee, situationFamiliale: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="celibataire">Célibataire</option>
                      <option value="marie">Marié(e)</option>
                      <option value="divorce">Divorcé(e)</option>
                      <option value="veuf">Veuf(ve)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre d'Enfants à Charge
                    </label>
                    <input
                      type="number"
                      value={currentEmployee.nombreEnfants}
                      onChange={(e) => setCurrentEmployee({ ...currentEmployee, nombreEnfants: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      min="0"
                      step="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie
                    </label>
                    <select
                      value={currentEmployee.categorie}
                      onChange={(e) => setCurrentEmployee({ ...currentEmployee, categorie: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="salarie">Salarié</option>
                      <option value="cadre">Cadre</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleCalculate}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    <Calculator className="w-5 h-5" />
                    Calculer
                  </button>
                  <button
                    onClick={handleAddEmployee}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <Users className="w-5 h-5" />
                    Ajouter à la liste
                  </button>
                </div>

                {payrollResult && (
                  <div className="mt-8 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900">Résultats du Calcul</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-blue-900 mb-3">Cotisations Salariales</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>CNAS (9%)</span>
                            <span className="font-medium">{payrollResult.cotisationsCNAS.toFixed(2)} DZD</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Retraite (9.25%)</span>
                            <span className="font-medium">{payrollResult.cotisationRetraite.toFixed(2)} DZD</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Assurance Chômage (0.5%)</span>
                            <span className="font-medium">{payrollResult.assuranceChomage.toFixed(2)} DZD</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-blue-300">
                            <span className="font-semibold">Total</span>
                            <span className="font-bold">{payrollResult.totalCotisationsSalariales.toFixed(2)} DZD</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-purple-900 mb-3">Charges Patronales</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>CNAS (12.5%)</span>
                            <span className="font-medium">{payrollResult.employerCNAS.toFixed(2)} DZD</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Retraite (10.25%)</span>
                            <span className="font-medium">{payrollResult.employerRetraite.toFixed(2)} DZD</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Assurance Chômage (1%)</span>
                            <span className="font-medium">{payrollResult.employerChomage.toFixed(2)} DZD</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-purple-300">
                            <span className="font-semibold">Total</span>
                            <span className="font-bold">{payrollResult.totalChargesPatronales.toFixed(2)} DZD</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="text-sm text-green-700 mb-1">Salaire Imposable</div>
                        <div className="text-2xl font-bold text-green-900">{payrollResult.salaireImposable.toFixed(2)} DZD</div>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <div className="text-sm text-orange-700 mb-1">IRG</div>
                        <div className="text-2xl font-bold text-orange-900">{payrollResult.irg.toFixed(2)} DZD</div>
                      </div>

                      <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                        <div className="text-sm text-indigo-700 mb-1">Salaire Net</div>
                        <div className="text-2xl font-bold text-indigo-900">{payrollResult.salaireNet.toFixed(2)} DZD</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-lg text-white">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm opacity-90">Coût Total pour l'Employeur</div>
                          <div className="text-3xl font-bold">{payrollResult.coutTotal.toFixed(2)} DZD</div>
                        </div>
                        <DollarSign className="w-12 h-12 opacity-50" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'employees' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Liste des Employés</h3>
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Exporter CSV
                  </button>
                </div>

                {employees.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Aucun employé enregistré</p>
                    <p className="text-sm">Utilisez le calculateur pour ajouter des employés</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prénom</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salaire Brut</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salaire Net</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Situation</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {employees.map((emp) => {
                          const result = calculatePayroll(emp)
                          return (
                            <tr key={emp.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">{emp.nom}</td>
                              <td className="px-4 py-3 text-sm">{emp.prenom}</td>
                              <td className="px-4 py-3 text-sm font-medium">{result.salaireBrut.toFixed(2)} DZD</td>
                              <td className="px-4 py-3 text-sm font-medium text-green-600">{result.salaireNet.toFixed(2)} DZD</td>
                              <td className="px-4 py-3 text-sm">{emp.situationFamiliale}</td>
                              <td className="px-4 py-3 text-sm">
                                <button
                                  onClick={() => handleDeleteEmployee(emp.id)}
                                  className="text-red-600 hover:text-red-800 font-medium"
                                >
                                  Supprimer
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Rapport de Paie</h3>

                {employees.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Aucune donnée à afficher</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {(() => {
                        const totals = employees.reduce((acc, emp) => {
                          const result = calculatePayroll(emp)
                          return {
                            brut: acc.brut + result.salaireBrut,
                            net: acc.net + result.salaireNet,
                            cotisations: acc.cotisations + result.totalCotisationsSalariales,
                            charges: acc.charges + result.totalChargesPatronales,
                            cout: acc.cout + result.coutTotal
                          }
                        }, { brut: 0, net: 0, cotisations: 0, charges: 0, cout: 0 })

                        return (
                          <>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                              <div className="text-sm text-blue-700 mb-1">Total Salaires Bruts</div>
                              <div className="text-xl font-bold text-blue-900">{totals.brut.toFixed(2)} DZD</div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                              <div className="text-sm text-green-700 mb-1">Total Salaires Nets</div>
                              <div className="text-xl font-bold text-green-900">{totals.net.toFixed(2)} DZD</div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                              <div className="text-sm text-purple-700 mb-1">Total Charges Patronales</div>
                              <div className="text-xl font-bold text-purple-900">{totals.charges.toFixed(2)} DZD</div>
                            </div>
                            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                              <div className="text-sm text-indigo-700 mb-1">Coût Total</div>
                              <div className="text-xl font-bold text-indigo-900">{totals.cout.toFixed(2)} DZD</div>
                            </div>
                          </>
                        )
                      })()}
                    </div>

                    <div className="bg-white border rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Détails par Employé</h4>
                      <div className="space-y-4">
                        {employees.map((emp) => {
                          const result = calculatePayroll(emp)
                          return (
                            <div key={emp.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                              <div className="font-medium text-gray-900">{emp.prenom} {emp.nom}</div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                                <div>
                                  <span className="text-gray-600">Brut:</span>
                                  <span className="ml-2 font-medium">{result.salaireBrut.toFixed(2)} DZD</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Cotisations:</span>
                                  <span className="ml-2 font-medium">{result.totalCotisationsSalariales.toFixed(2)} DZD</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">IRG:</span>
                                  <span className="ml-2 font-medium">{result.irg.toFixed(2)} DZD</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Net:</span>
                                  <span className="ml-2 font-medium text-green-600">{result.salaireNet.toFixed(2)} DZD</span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Informations sur les Cotisations Algériennes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-indigo-600 mb-2">Cotisations Salariales</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• CNAS (Sécurité Sociale): 9%</li>
                <li>• Retraite: 9.25%</li>
                <li>• Assurance Chômage: 0.5%</li>
                <li>• Total: 18.75%</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">Cotisations Patronales</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• CNAS (Sécurité Sociale): 12.5%</li>
                <li>• Retraite: 10.25%</li>
                <li>• Assurance Chômage: 1%</li>
                <li>• Total: 23.75%</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-orange-600 mb-2">Barème IRG 2024</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• 0 - 30 000 DZD: 0%</li>
                <li>• 30 001 - 120 000 DZD: 20%</li>
                <li>• 120 001 - 360 000 DZD: 30%</li>
                <li>• Plus de 360 000 DZD: 35%</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-600 mb-2">Abattements IRG</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• Conjoint: 1 000 DZD</li>
                <li>• Par enfant à charge: 500 DZD</li>
                <li>• Applicable sur le salaire imposable</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white mt-12 border-t">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>© 2024 Système de Gestion de Paie - Conforme à la législation algérienne</p>
        </div>
      </footer>
    </div>
  )
}
